import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Telegraf, Markup, Context } from 'telegraf';
import { AnalyticsBaseQueryDto } from 'src/analytics/dto/analytics-range.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TelegramUser } from './entities/telegram-user.entity';
import { TelegramStateService } from './telegram.state';
import { AuthService } from 'src/auth/services/auth.service';
import { AnalyticsService } from 'src/analytics/services/analytics.service';

type TCtx = Context;

function kbMain() {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('Kunlik', 'KPI_DAILY'),
      Markup.button.callback('Haftalik', 'KPI_WEEKLY'),
    ],
    [
      Markup.button.callback('Oylik', 'KPI_MONTHLY'),
      Markup.button.callback('Yillik', 'KPI_YEARLY'),
    ],
  ]);
}

function ymdFrom(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function inTashkentNow(): Date {
  const now = new Date();
  const tzOffsetMin = -now.getTimezoneOffset();
  const tzPlus5 = 5 * 60;
  const delta = (tzPlus5 - tzOffsetMin) * 60_000;
  return new Date(now.getTime() + delta);
}
function tzStartOfDay(d: Date): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(Date.UTC(y, m, day, 0, 0, 0, 0));
}
function tzEndOfDay(d: Date): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(Date.UTC(y, m, day, 23, 59, 59, 999));
}

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private bot?: Telegraf;
  constructor(
    @InjectRepository(TelegramUser)
    private readonly repo: Repository<TelegramUser>,
    private readonly state: TelegramStateService,
    private readonly auth: AuthService,
    private readonly analytics: AnalyticsService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit() {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) return;
    const bot = new Telegraf(token);
    this.bot = bot;

    bot.start(async (ctx: Context) => {
      const existing = await this.ensureAuthorized(ctx);
      const name = this.config.get<string>('TELEGRAM_BOT_USERNAME') ?? '';
      if (existing) {
        const menu = kbMain();
        await ctx.reply(
          `Salom! Siz allaqachon bog'langansiz. KPI davrini tanlang:`,
          { reply_markup: menu.reply_markup },
        );
      } else {
        await ctx.reply(
          `Assalomu alaykum${name ? ' (' + name + ')' : ''}! Iltimos, foydalanuvchi nomingizni kiriting:`,
        );
        const chatId = String(ctx.chat?.id ?? '');
        if (!chatId) return;
        this.state.set(chatId, { phase: 'awaiting_username' });
      }
    });

    bot.on('text', async (ctx: Context & { message: { text: string } }) => {
      const chatId = String(ctx.chat?.id ?? '');
      if (!chatId) return;
      const st = this.state.get(chatId);
      const text: string = ctx.message.text.trim();
      if (!text) return;
      if (st.phase === 'awaiting_username') {
        this.state.set(chatId, {
          phase: 'awaiting_password',
          tmpUsername: text,
        });
        await ctx.reply('Parolni kiriting:');
        return;
      }
      if (st.phase === 'awaiting_password') {
        const username = st.tmpUsername!;
        const password = text;
        try {
          const user = await this.auth.validateUser(username, password);
          if (!user) throw new Error('Invalid');
          const auth = await this.auth.login(user);
          const telegramId = String(ctx.from?.id ?? '');
          if (!telegramId) {
            await ctx.reply("Telegram ID aniqlanmadi. Qayta urinib ko'ring.");
            this.state.reset(chatId);
            return;
          }
          const entity = this.repo.create({
            telegramId,
            chatId,
            userId: user.id,
            username: user.username,
            accessToken: auth.access_token,
            refreshToken: auth.refresh_token,
          });
          await this.repo.save(entity);
          this.state.reset(chatId);
          const menu = kbMain();
          await ctx.reply("Muvaffaqiyatli bog'landi! KPI davrini tanlang:", {
            reply_markup: menu.reply_markup,
          });
        } catch {
          await ctx.reply(
            "Login yoki parol noto'g'ri. Qaytadan /start bosing.",
          );
          this.state.reset(chatId);
        }
        return;
      }
      const menu = kbMain();
      await ctx.reply('Davrni tanlang:', { reply_markup: menu.reply_markup });
    });

    bot.action('KPI_DAILY', async (ctx) => {
      await ctx.answerCbQuery();
      const now = inTashkentNow();
      const from = tzStartOfDay(now);
      const to = tzEndOfDay(now);
      await this.sendKpi(ctx, from, to, 'Kunlik');
    });
    bot.action('KPI_WEEKLY', async (ctx) => {
      await ctx.answerCbQuery();
      const now = inTashkentNow();
      const day = now.getUTCDay();
      const offsetToMon = day === 0 ? -6 : 1 - day;
      const monday = new Date(
        now.getTime() + offsetToMon * 24 * 60 * 60 * 1000,
      );
      const from = tzStartOfDay(monday);
      const to = tzEndOfDay(now);
      await this.sendKpi(ctx, from, to, 'Haftalik');
    });
    bot.action('KPI_MONTHLY', async (ctx) => {
      await ctx.answerCbQuery();
      const now = inTashkentNow();
      const start = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
      );
      const from = start;
      const to = tzEndOfDay(now);
      await this.sendKpi(ctx, from, to, 'Oylik');
    });
    bot.action('KPI_YEARLY', async (ctx) => {
      await ctx.answerCbQuery();
      const now = inTashkentNow();
      const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
      const from = start;
      const to = tzEndOfDay(now);
      await this.sendKpi(ctx, from, to, 'Yillik');
    });

    bot
      .launch()
      .then(() => console.log('[TelegramBot] launched'))
      .catch((e) =>
        console.error('[TelegramBot] launch failed:', (e as Error)?.message ?? e),
      );
  }

  onModuleDestroy() {
    this.bot?.stop('SIGTERM');
  }

  private async ensureAuthorized(ctx: TCtx): Promise<TelegramUser | null> {
    const chatId = String(ctx.chat?.id ?? '');
    const telegramId = String(ctx.from?.id ?? '');
    if (!chatId || !telegramId) return null;
    const existing = await this.repo.findOne({
      where: { telegramId, isActive: true },
    });
    return existing ?? null;
  }

  private async sendKpi(ctx: Context, from: Date, to: Date, label: string) {
    const createdFrom = ymdFrom(from);
    const createdTo = ymdFrom(to);
    const dto = new AnalyticsBaseQueryDto();
    dto.createdFrom = createdFrom;
    dto.createdTo = createdTo;
    const data = await this.analytics.kpis(dto);

    {
      const menu = kbMain();
      const out: string[] = [];
      out.push(`<b>${label} KPI</b>`);
      out.push(`Davr: ${createdFrom} - ${createdTo}`);
      out.push('');
      if (data?.stock) {
        out.push('<b>Ombor</b>');
        out.push(`- Xom ashyo KG: <code>${data.stock.rawKg}</code>`);
        out.push(`- Xom ashyo DONA: <code>${data.stock.rawUnit}</code>`);
        out.push(`- Mahsulot KG: <code>${data.stock.productKg}</code>`);
        out.push(`- Mahsulot DONA: <code>${data.stock.productUnit}</code>`);
        out.push('');
      }
      if (typeof data?.totalProfit === 'number') {
        out.push(`<b>Umumiy foyda</b>: <code>${data.totalProfit}</code>`);
        out.push('');
      }
      if (data?.admin) {
        out.push('<b>Admin</b>');
        out.push(
          `- Ta'minotchilarga kreditorlik: <code>${data.admin.totalDebtFromSuppliers}</code>`,
        );
        out.push(
          `- Mijozlardan debitorlik: <code>${data.admin.totalCreditFromClients}</code>`,
        );
      }

      await ctx.replyWithHTML(out.join('\n'), {
        reply_markup: menu.reply_markup,
      });
      return;
    }

    const lines: string[] = [];
    lines.push(`📊 <b>${label} KPIs</b>`);
    lines.push(`🗓️ ${createdFrom} → ${createdTo}`);
    lines.push('');
    if (data?.stock) {
      lines.push('<b>Ombor</b>');
      lines.push(`• Raw KG: <code>${data.stock.rawKg}</code>`);
      lines.push(`• Raw UNIT: <code>${data.stock.rawUnit}</code>`);
      lines.push(`• Product KG: <code>${data.stock.productKg}</code>`);
      lines.push(`• Product UNIT: <code>${data.stock.productUnit}</code>`);
      lines.push('');
    }
    if (typeof data?.totalProfit === 'number') {
      lines.push(`<b>Umumiy foyda</b>: <code>${data.totalProfit}</code>`);
      lines.push('');
    }
    if (data?.admin) {
      lines.push('<b>Admin</b>');
      lines.push(
        `• Debt to suppliers: <code>${data.admin.totalDebtFromSuppliers}</code>`,
      );
      lines.push(
        `• Receivables from clients: <code>${data.admin.totalCreditFromClients}</code>`,
      );
    }

    const menu = kbMain();
    await ctx.replyWithHTML(lines.join('\n'), {
      reply_markup: menu.reply_markup,
    });
  }
}
