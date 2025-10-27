import { useGetKPIsQuery } from '@/api/analytics';
import type { GetStatisticsArgs } from '@/api/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatQuantity } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Building2,
  Calendar,
  Boxes,
  Factory,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnalyticsFilters } from '@/components/analytics/AnalyticsFilters';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  isCount?: boolean;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({ 
  value, 
  duration = 1000, 
  isCount = false, 
  prefix = '', 
  suffix = '' 
}: AnimatedCounterProps) {
  const animatedValue = useMemo(() => {
    // Preserve sign so negatives are displayed
    return value;
  }, [value]);

  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="font-bold text-lg sm:text-xl md:text-2xl"
    >
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {isCount ? formatQuantity(animatedValue) : formatQuantity(animatedValue)}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  isCount?: boolean;
  suffix?: string;
  className?: string;
  delay?: number;
}

function KPICard({ 
  title, 
  value, 
  icon, 
  trend = 'neutral', 
  isCount = false, 
  suffix = '', 
  className = '',
  delay = 0
}: KPICardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn("group", className)}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background/80 to-primary/5 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
            {title}
          </CardTitle>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2"
          >
            <div className="w-4 h-4 sm:w-5 sm:h-5">
              {icon}
            </div>
          </motion.div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
          <div className="flex items-center justify-between">
            <div className={cn("flex flex-col", getTrendColor())}>
              <AnimatedCounter 
                value={value} 
                isCount={isCount} 
                suffix={suffix}
              />
            </div>
            <div className="flex-shrink-0 ml-2">
              {getTrendIcon()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StockProgressBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  delay?: number;
}

function StockProgressBar({ label, value, maxValue, color, delay = 0 }: StockProgressBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-2"
    >
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{formatQuantity(value)}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          className={cn("h-2 rounded-full", color)}
        />
      </div>
    </motion.div>
  );
}

export function KPIDashboard() {
  const [filters, setFilters] = useState<GetStatisticsArgs>({});
  const { data, isLoading, error } = useGetKPIsQuery(filters);

  const handleFiltersChange = (newFilters: GetStatisticsArgs) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <Card className="h-32">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full p-6"
      >
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Ma'lumotlarni yuklashda xatolik yuz berdi</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const from = data?.period?.from ? new Date(data.period.from) : null;
  const to = data?.period?.to ? new Date(data.period.to) : null;

  const totalRawStock = (data?.stock?.rawKg || 0) + (data?.stock?.rawUnit || 0);
  const totalProductStock = (data?.stock?.productKg || 0) + (data?.stock?.productUnit || 0);
  const totalStock = totalRawStock + totalProductStock;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full p-6 space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Boshqaruv Paneli
        </h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            Davr: {from ? from.toLocaleDateString('uz-UZ') : '—'} — {to ? to.toLocaleDateString('uz-UZ') : '—'}
          </span>
        </div>
      </motion.div>

      {/* Analytics Filters */}
      <AnalyticsFilters 
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
        isLoading={isLoading}
      />

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Jami Foyda"
          value={data?.totalProfit || 0}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={data?.totalProfit && data.totalProfit > 0 ? 'up' : 'down'}
          suffix=" so'm"
          delay={0.1}
        />
        
        <KPICard
          title="Homashyo (KG)"
          value={data?.stock?.rawKg || 0}
          icon={<Boxes className="h-5 w-5" />}
          isCount={true}
          suffix=" kg"
          delay={0.2}
        />
        
        <KPICard
          title="Homashyo (Dona)"
          value={data?.stock?.rawUnit || 0}
          icon={<Boxes className="h-5 w-5" />}
          isCount={true}
          suffix=" dona"
          delay={0.3}
        />
        
        <KPICard
          title="Mahsulotlar"
          value={totalProductStock}
          icon={<Package className="h-5 w-5" />}
          isCount={true}
          suffix=" dona"
          delay={0.4}
        />
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Details */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Factory className="h-5 w-5 text-blue-500" />
                <CardTitle>Ombor Tafsilotlari</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <StockProgressBar
                label="Homashyo (KG)"
                value={data?.stock?.rawKg || 0}
                maxValue={totalStock}
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                delay={0.1}
              />
              
              <StockProgressBar
                label="Homashyo (Dona)"
                value={data?.stock?.rawUnit || 0}
                maxValue={totalStock}
                color="bg-gradient-to-r from-purple-500 to-purple-600"
                delay={0.2}
              />
              
              <StockProgressBar
                label="Mahsulotlar (KG)"
                value={data?.stock?.productKg || 0}
                maxValue={totalStock}
                color="bg-gradient-to-r from-green-500 to-green-600"
                delay={0.3}
              />
              
              <StockProgressBar
                label="Mahsulotlar (Dona)"
                value={data?.stock?.productUnit || 0}
                maxValue={totalStock}
                color="bg-gradient-to-r from-emerald-500 to-emerald-600"
                delay={0.4}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Balances */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-500" />
                <CardTitle>Moliyaviy Balanslar</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/20">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium">Mijozlardan Olinadigan</span>
                  </div>
                  <AnimatedCounter 
                    value={data?.admin?.totalCreditFromClients || 0} 
                    suffix=" so'm"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-500/20">
                      <Boxes className="h-4 w-4 text-red-600" />
                    </div>
                    <span className="font-medium">Ta'minotchilarga To'lanadigan</span>
                  </div>
                  <AnimatedCounter 
                    value={data?.admin?.totalDebtFromSuppliers || 0} 
                    suffix=" so'm"
                  />
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
