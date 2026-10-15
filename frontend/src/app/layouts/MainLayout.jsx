import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import MainHeader from '../../shared/components/MainHeader/MainHeader';
import CategoryMenu from '../../shared/components/CategoryMenu/CategoryMenu';

const MainLayout = () => {
    return (
        <>
            <Header />
            <MainHeader />
            <CategoryMenu />
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;
