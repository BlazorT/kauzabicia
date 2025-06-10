import HeaderAddress from "./header-address";
import HeaderLogo from "./header-logo";
import HeaderProfile from "./heder-profile";
import HeaderCart from "./header-cart";
import { ModeToggle } from "../ui/theme-menu";
import { DialogProps } from "@/utils/types";

const HomeHeader: React.FC<DialogProps> = ({
  isMapVisible,
  toggleIsMapVisble,
}) => {
  return (
    // Main container: column on small, row on large
    <div className="flex flex-col lg:flex-row items-center justify-between w-full">
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
        <HeaderAddress
          isMapVisible={isMapVisible}
          toggleIsMapVisble={toggleIsMapVisble}
        />{" "}
        {/* Center */}
        {/* Right group: Actions */}
        <div className="flex gap-5 items-center">
          <HeaderProfile />
          <ModeToggle />
          <HeaderCart />
        </div>
      </div>

      {/* Address for small screens - shown below the first row */}
      <div className="lg:hidden w-full flex justify-center mt-2 text-sm">
        <HeaderAddress
          isMapVisible={isMapVisible}
          toggleIsMapVisble={toggleIsMapVisble}
        />
      </div>
    </div>
  );
};

export default HomeHeader;
