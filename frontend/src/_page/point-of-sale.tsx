import { BentoGridHome } from '@/components/bento/bentodemo';
import ErrorBoundary from '@/components/toaster/toaster';
import RootLayout from '@/layout';
const page = () => {
  return (
    <RootLayout>
      <div className="w-full">
        <ErrorBoundary>
          <div>Point of sale</div>
        </ErrorBoundary>
      </div>
    </RootLayout>
  );
};

export default page;
