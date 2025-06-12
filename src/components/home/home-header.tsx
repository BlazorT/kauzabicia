import { SearchBar } from "../menu/search-bar";
import { ModeToggle } from "../ui/theme-menu";
import HeaderCart from "./header-cart";
import HeaderLogo from "./header-logo";
import HeaderProfile from "./heder-profile";

interface HomeHeaderProps {
  setSearchQuery: (value: string) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ setSearchQuery }) => {
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
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search Products..."
          className="max-w-100"
        />
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
  );
};

export default HomeHeader;
