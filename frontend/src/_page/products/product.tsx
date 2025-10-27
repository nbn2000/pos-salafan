import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InventoryLogs } from '@/components/tableinventorylogs/table';
import TableProducts from '@/components/tableproduct/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LowStockProductNotifications } from '@/components/common/LowStockProductNotifications';
import RootLayout from '@/layout';

type TabValue = 'products' | 'logs';
const allowedTabs: TabValue[] = ['products', 'logs'];
const defaultTab: TabValue = 'products';

export default function ProductsTabsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabValue>(() => {
    const param = new URLSearchParams(location.search).get('tab');
    return allowedTabs.includes(param as TabValue)
      ? (param as TabValue)
      : defaultTab;
  });

  const handleTabChange = (value: string) => {
    const nextTab = allowedTabs.includes(value as TabValue)
      ? (value as TabValue)
      : defaultTab;
    setActiveTab(nextTab);

    const params = new URLSearchParams();
    if (nextTab !== defaultTab) {
      params.set('tab', nextTab);
    }

    const nextSearch = params.toString();
    const normalizedNextSearch = nextSearch ? `?${nextSearch}` : '';

    if (normalizedNextSearch !== location.search) {
      navigate(
        {
          pathname: location.pathname,
          search: normalizedNextSearch,
          hash: location.hash,
        },
        { replace: true }
      );
    }
  };

  return (
    <RootLayout>
      <div className="w-full h-full min-h-0 flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full flex-1 h-full min-h-0 flex flex-col"
        >
          <TabsList>
            <div className="flex w-full justify-between items-center">
              <div />
              <div>
                <TabsTrigger value="products">Mahsulotlar</TabsTrigger>
                <TabsTrigger value="logs">Loglar</TabsTrigger>
              </div>
              <div>
                <LowStockProductNotifications />
              </div>
            </div>
          </TabsList>
          <TabsContent value="products" className="h-full flex-1 min-h-0">
            <TableProducts />
          </TabsContent>
          <TabsContent value="logs" className="h-full flex-1 min-h-0">
            <InventoryLogs />
          </TabsContent>
        </Tabs>
      </div>
    </RootLayout>
  );
}
