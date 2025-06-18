import HeaderCart from "@/components/home/header-cart";
import HeaderLogo from "@/components/home/header-logo";
import HeaderProfile from "@/components/home/heder-profile";
import { ModeToggle } from "@/components/ui/theme-menu";

type OrderLayoutProps = {
  children: React.ReactNode;
};

const OrderLayout: React.FC<OrderLayoutProps> = ({ children }) => {
  return (
    // Main container: column on small, row on large
    <div className="container mx-auto p-2">
      <div className="fixed container mx-auto py-2 top-0 left-0 right-0 z-30 bg-background px-2 xl:px-0">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Layout for small screens */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <HeaderProfile /> {/* Left */}
            <HeaderLogo /> {/* Center */}
            {/* Right group: Actions */}
            <div className="flex gap-5 items-center">
              <ModeToggle />
              <HeaderCart />
            </div>
          </div>

          {/* Layout for large screens */}
          <div className="hidden lg:flex items-center justify-between w-full">
            <HeaderLogo /> {/* Left */}
            {/* <HeaderAddress
          isMapVisible={isMapVisible}
          toggleIsMapVisble={toggleIsMapVisble}
          />{" "} */}
            {/* Center */}
            {/* Right group: Actions */}
            <div className="flex gap-5 items-center">
              <HeaderProfile />
              <ModeToggle />
              <HeaderCart />
            </div>
          </div>

          {/* Address for small screens - shown below the first row */}
          {/* <div className="lg:hidden w-full flex justify-center mt-2 text-sm">
        <HeaderAddress
        isMapVisible={isMapVisible}
        toggleIsMapVisble={toggleIsMapVisble}
        />
        </div> */}
        </div>
      </div>
      {children}
    </div>
  );
};

export default OrderLayout;
