import React, { ReactNode } from 'react';
import Nav from './Nav';
import Footer from './Footer';
import { useApi } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../constants';
import styles from './Layout.module.css';
import { GetApiResponse } from '@/types/restapi';


interface LayoutProps {
    children: ReactNode;
}

interface ResponseMessage {
    message: string;
}


const Layout: React.FC<LayoutProps> = ({ children }) => {
    // useApi is now typed, so 'data' is RootData | null
    // const { responseData, error } = useApi<GetApiResponse<ResponseMessage> >(API_ENDPOINTS.TEST_ROOT);

    // if (error) {
    //     return <div>Error loading data</div>;
    // }

    return (
        <div className={styles.Layout}>

            <Nav />
            <main className={styles.main}>{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;
