import HeroBanner from "./components/HeroBanner";
import PromoGrid from "./components/PromoGrid";
import CustomerGallery from "./components/CustomerGallery";
import CartDemoProducts from "../../../modules/cart-checkout/components/CartDemoProducts.jsx";
import styles from "./Home.module.css";

const Home = () => {
    return (
        <div className={styles.page}>
            <HeroBanner />
            <PromoGrid />
            <CartDemoProducts />
            <CustomerGallery />
        </div>
    );
};

export default Home;
