import { USER_ROLE } from "@/constants/constants";
import { useAlert } from "@/context/alert-context";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { useOrder } from "@/context/order-context";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import { ORDER, OrderProduct } from "@/utils/types";
import moment from "moment";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useLocation } from "@/context/location-context";
import { parseLatandLong } from "@/utils/storeUtils";

type ManageOrderProps = {
  order_products: OrderProduct[];
  order: ORDER;
};

const ManageOrder: React.FC<ManageOrderProps> = ({
  order_products,
  order: orderDetail,
}) => {
  const order = order_products[0];
  const router = useRouter();
  const { user } = useAuth();
  const { clearCart, items } = useCart();
  const { showAlert } = useAlert();
  const { resetOrderInfo } = useOrder();
  const { setSelectedPosition } = useLocation();
  const { storeData } = useStoreInfo(order?.sku);

  // const [showMenu, setShowMenu] = useState(false);

  // const toggleShowMenu = () => setShowMenu((prev) => !prev);

  const isUnauthorizedUser = !user || user.roleId === USER_ROLE.USER;
  const isInvalidOrder =
    !order ||
    order?.dCode !== "" ||
    order.status === 5 ||
    order.status === 3 ||
    order.paymentStatusId === 1;

  if (isUnauthorizedUser || isInvalidOrder) {
    return null;
  }

  const onManageOrder = () => {
    if (!storeData?.isStoreOpen) {
      showAlert({
        title: "Store Closed",
        description: `The ${
          storeData?.store?.name
        } is closed on ${moment().format("DD-MM-YYYY, hh:mm")}`,
        confirmText: "OK",
      });
      return;
    }
    if (items.length > 0 && items[0]?.storeId !== parseInt(order.sku)) {
      clearCart();
      resetOrderInfo();
    }

    addOrderToCart();
  };

  const addOrderToCart = () => {
    if (orderDetail?.gpsLocation) {
      const orderLocation = parseLatandLong(orderDetail?.gpsLocation);
      setSelectedPosition([orderLocation.latitude, orderLocation.longitude]);
    }
    router.push(
      `/${btoa(order?.sku)}/?saleId=${btoa(order?.saleId?.toString())}`
    );
    clearCart();
    resetOrderInfo();
  };
  // console.log({ order });
  return (
    <>
      {/* <OrderMenuDialog
        isVisible={showMenu}
        toggleDialog={toggleShowMenu}
        order={order}
        products={order_products}
      /> */}
      <Button
        variant="outline"
        size="sm"
        className="w-auto"
        onClick={onManageOrder}
      >
        Manage Order
      </Button>
    </>
  );
};

export default ManageOrder;
