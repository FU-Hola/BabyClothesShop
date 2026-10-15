import { Outlet } from 'react-router-dom';
import Header from '../../shared/components/Header/Header';
import MainHeader from '../../shared/components/MainHeader/MainHeader';

const MainLayout = () => {
    return (
        <>
            <Header />
            <MainHeader />
            <main>
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;
