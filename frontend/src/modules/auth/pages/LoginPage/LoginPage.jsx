import LoginForm from '../../components/LoginForm/LoginForm';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    return (
        <div className={styles.page}>
            <LoginForm />
        </div>
    );
};

export default LoginPage;
