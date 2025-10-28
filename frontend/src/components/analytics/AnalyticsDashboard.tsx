import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn, formatQuantity } from '@/lib/utils';
import { useGetKPIsQuery, useGetStatisticsQuery } from '@/api/analytics';
import type { GetStatisticsArgs } from '@/api/analytics';
import { AnalyticsFilters } from './AnalyticsFilters';

interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ReactNode;
  suffix?: string;
  isCount?: boolean;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
  delay?: number;
}

function MetricCard({ 
  title, 
  value, 
  previousValue, 
  icon, 
  suffix = '', 
  isCount = false,
  trend = 'neutral',
  className = '',
  delay = 0
}: MetricCardProps) {
  const changePercentage = useMemo(() => {
    if (!previousValue || previousValue === 0) return null;
    return ((value - previousValue) / previousValue) * 100;
  }, [value, previousValue]);

  const getTrendIcon = () => {
    if (changePercentage === null) return null;
    return changePercentage > 0 
      ? <ArrowUpRight className="h-4 w-4 text-green-500" />
      : <ArrowDownRight className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (changePercentage === null) return 'text-foreground';
    return changePercentage > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn("group", className)}
    >
      <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </CardTitle>
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="text-muted-foreground group-hover:text-primary transition-colors"
          >
            {icon}
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: delay + 0.2 }}
                className={cn("text-2xl font-bold", getTrendColor())}
              >
                {isCount ? formatQuantity(Math.abs(value)) : formatQuantity(Math.abs(value))}
                {suffix}
              </motion.span>
              {getTrendIcon()}
            </div>
            
            {changePercentage !== null && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.4 }}
                className="flex items-center gap-1 text-xs"
              >
                <span className={getTrendColor()}>
                  {changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">oldingi davrga nisbatan</span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [filters, setFilters] = useState<GetStatisticsArgs>({});
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useGetKPIsQuery(filters);
  const { data: statsData, isLoading: statsLoading, error: statsError } = useGetStatisticsQuery(filters);

  const isLoading = kpiLoading || statsLoading;
  const hasError = kpiError || statsError;

  const handleFiltersChange = (newFilters: GetStatisticsArgs) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    // Force refetch by updating filters
    setFilters({ ...filters });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export data:', { kpiData, statsData, filters });
  };

  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn("w-full p-6", className)}
      >
        <Card className="border-destructive">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">Ma'lumotlarni yuklashda xatolik</h3>
              <p className="text-muted-foreground mt-2">
                Iltimos, sahifani yangilang yoki keyinroq qayta urinib ko'ring.
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Qayta yuklash
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const from = kpiData?.period?.from ? new Date(kpiData.period.from) : null;
  const to = kpiData?.period?.to ? new Date(kpiData.period.to) : null;

  const totalStock = (kpiData?.stock?.productKg || 0) + 
                    (kpiData?.stock?.productUnit || 0) + 
                    (kpiData?.stock?.rawKg || 0) + 
                    (kpiData?.stock?.rawUnit || 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={cn("w-full p-6 space-y-8", className)}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Analitika Dashboard
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Davr: {from ? from.toLocaleDateString('uz-UZ') : '—'} — {to ? to.toLocaleDateString('uz-UZ') : '—'}
            </span>
            {isLoading && (
              <Badge variant="secondary" className="ml-2">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Yuklanmoqda...
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Yangilash
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Eksport
          </Button>
        </div>
      </motion.div>

      {/* Analytics Filters */}
      <AnalyticsFilters 
        onFiltersChange={handleFiltersChange}
        initialFilters={filters}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Umumiy Ko'rinish
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Moliyaviy
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Ombor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Jami Foyda"
              value={kpiData?.totalProfit || 0}
              icon={<TrendingUp className="h-5 w-5" />}
              suffix=" so'm"
              delay={0.1}
            />
            
            <MetricCard
              title="Sof Foyda"
              value={kpiData?.totalProfit || 0}
              icon={<DollarSign className="h-5 w-5" />}
              suffix=" so'm"
              delay={0.2}
            />
            
            <MetricCard
              title="Jami Xarajatlar"
              value={0} // totalExpenses not available in current API
              icon={<TrendingDown className="h-5 w-5" />}
              suffix=" so'm"
              delay={0.3}
            />
            
            <MetricCard
              title="Jami Ombor"
              value={totalStock}
              icon={<Package className="h-5 w-5" />}
              isCount={true}
              suffix=" dona"
              delay={0.4}
            />
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Daromadlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <span className="font-medium">Jami Foyda</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatQuantity(kpiData?.totalProfit || 0)} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <span className="font-medium">Sof Foyda</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatQuantity(kpiData?.totalProfit || 0)} so'm
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Xarajatlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <span className="font-medium">Jami Xarajatlar</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatQuantity(0)} so'm {/* totalExpenses not available */}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  Ombor Tafsilotlari
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tayyor Mahsulotlar</span>
                    <span className="font-medium">{formatQuantity(kpiData?.stock?.productUnit || 0)} dona</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                      style={{ 
                        width: totalStock > 0 
                          ? `${((kpiData?.stock?.productUnit || 0) / totalStock) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Ombordagi Yarim Tayyor</span>
                    <span className="font-medium">{formatQuantity(kpiData?.stock?.rawUnit || 0)} dona</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ 
                        width: totalStock > 0 
                          ? `${((kpiData?.stock?.rawUnit || 0) / totalStock) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Yig'uvchilardagi Yarim Tayyor</span>
                    <span className="font-medium">{formatQuantity(kpiData?.stock?.rawKg || 0)} kg</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                      style={{ 
                        width: totalStock > 0 
                          ? `${((kpiData?.stock?.rawKg || 0) / totalStock) * 100}%` 
                          : '0%' 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500" />
                  Moliyaviy Balanslar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <span className="font-medium">Mijozlardan Olinadigan</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatQuantity(kpiData?.admin?.totalCreditFromClients || 0)} so'm
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                  <span className="font-medium">Ta'minotchilarga To'lanadigan</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatQuantity(kpiData?.admin?.totalDebtFromSuppliers || 0)} so'm
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
