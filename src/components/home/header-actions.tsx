import { ModeToggle } from "../ui/theme-menu";
import HeaderCart from "./header-cart";
import HeaderProfile from "./heder-profile";

const HeaderActions = () => {
  return (
    <div className="flex gap-5 items-center">
      <HeaderProfile />
      <ModeToggle />
      <HeaderCart />
    </div>
  );
};

export default HeaderActions;
