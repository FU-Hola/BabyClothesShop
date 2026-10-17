import RegisterForm from '../../components/RegisterForm/RegisterForm';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
    return (
        <div className={styles.page}>
            <RegisterForm />
        </div>
    );
};

export default RegisterPage;
