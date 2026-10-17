import { Outlet } from "react-router-dom";
import CategoryMenu from "../../shared/components/CategoryMenu/CategoryMenu";
import Footer from "../../shared/components/Footer/Footer";
import Header from "../../shared/components/Header/Header";
import MainHeader from "../../shared/components/MainHeader/MainHeader";


const MainLayout = () => {
    return (
        <>
            <Header />
            <MainHeader />
            <CategoryMenu />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}

export default MainLayout;
