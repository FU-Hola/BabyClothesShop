import HeroBanner from "./components/HeroBanner";
import PromoGrid from "./components/PromoGrid";
import CustomerGallery from "./components/CustomerGallery";
import styles from "./Home.module.css";

const Home = () => {
    return (
        <div className={styles.page}>
            <HeroBanner />
            <PromoGrid />
            <CustomerGallery />
        </div>
    );
};

export default Home;
