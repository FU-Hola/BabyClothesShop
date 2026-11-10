import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Card,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import authApi from "../../api/authApi";
import styles from "./ForgotPasswordPage.module.css";

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
});

const ForgotPasswordPage = () => {
  const [message, setMessage] = useState("");
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data) => {
    setMessage("");
    setServerError("");
    try {
      const response = await authApi.forgotPassword(data);
      setMessage(response.message);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Không thể gửi yêu cầu. Vui lòng thử lại.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <Card className={`${styles.card} border-0 shadow-lg rounded-4`}>
        <Card.Body className={`${styles.cardBody} p-4 p-sm-5`}>
          <div className="text-center mb-4">
            <span className={styles.icon}>
              <Mail size={25} aria-hidden="true" />
            </span>
            <span className={styles.eyebrow}>Bảo mật tài khoản</span>
            <h1 className={`${styles.title} h2 mb-2`}>Quên mật khẩu</h1>
            <p className={`${styles.description} small mb-0`}>
              Nhập email tài khoản để nhận link thiết lập mật khẩu mới.
            </p>
          </div>
          {message && <Alert variant="success">{message}</Alert>}
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Form.Group controlId="forgot-password-email">
              <Form.Label className={styles.formLabel}>Email *</Form.Label>
              <InputGroup className={styles.inputGroup} hasValidation>
                <InputGroup.Text className={styles.inputIcon}>
                  <Mail size={18} aria-hidden="true" />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  autoComplete="email"
                  placeholder="example@gmail.com"
                  isInvalid={Boolean(errors.email)}
                  disabled={isSubmitting}
                  className={styles.inputControl}
                  {...register("email")}
                />
                <Form.Control.Feedback type="invalid" className="small">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Button
              type="submit"
              className={`${styles.submitButton} w-100 py-2 mt-4 fw-semibold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Send size={17} aria-hidden="true" />
              )}
              Gửi link đặt lại mật khẩu
            </Button>
          </Form>
          <div className="text-center mt-4 small">
            <Link to="/login" className={styles.backLink}>
              <ArrowLeft size={16} aria-hidden="true" />
              Quay lại đăng nhập
            </Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
