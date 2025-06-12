import Image from "next/image";
import Link from "next/link";

const HeaderLogo = () => {
  return (
    <Link href={"/"}>
      <div className="flex gap-2 items-center">
        <Image src={"/logo.jpeg"} alt="logo" width={130} height={130} />
      </div>
    </Link>
  );
};

export default HeaderLogo;
