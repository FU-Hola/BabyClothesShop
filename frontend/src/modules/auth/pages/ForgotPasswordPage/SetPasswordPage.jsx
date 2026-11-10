import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Card,
  Form,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import authApi from "../../api/authApi";
import styles from "./ForgotPasswordPage.module.css";

const schema = z
  .object({
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine(
    ({ newPassword, confirmPassword }) => newPassword === confirmPassword,
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmPassword"],
    },
  );

const SetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const response = await authApi.setPassword({ token, ...data });
      navigate("/login", {
        replace: true,
        state: { message: response.message },
      });
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Không thể thiết lập mật khẩu. Vui lòng yêu cầu link mới.",
      );
    }
  };

  return (
    <div className={styles.page}>
      <Card className={`${styles.card} border-0 shadow-lg rounded-4`}>
        <Card.Body className={`${styles.cardBody} p-4 p-sm-5`}>
          <div className="text-center mb-4">
            <span className={styles.icon}>
              <KeyRound size={25} aria-hidden="true" />
            </span>
            <span className={styles.eyebrow}>Bảo mật tài khoản</span>
            <h1 className={`${styles.title} h2 mb-2`}>Thiết lập mật khẩu</h1>
            <p className={`${styles.description} small mb-0`}>
              Mật khẩu này sẽ được dùng cho những lần đăng nhập tiếp theo.
            </p>
          </div>
          {!token && (
            <Alert variant="danger">
              Link thiết lập mật khẩu không hợp lệ.
            </Alert>
          )}
          {serverError && <Alert variant="danger">{serverError}</Alert>}
          {token && (
            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Form.Group className="mb-3" controlId="set-password-new">
                <Form.Label className={styles.formLabel}>
                  Mật khẩu mới *
                </Form.Label>
                <InputGroup className={styles.inputGroup} hasValidation>
                  <InputGroup.Text className={styles.inputIcon}>
                    <LockKeyhole size={18} aria-hidden="true" />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Nhập mật khẩu mới"
                    isInvalid={Boolean(errors.newPassword)}
                    disabled={isSubmitting}
                    className="bg-light border-start-0 border-end-0 py-2"
                    {...register("newPassword")}
                  />
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="bg-light border-start-0 text-secondary rounded-end-3 d-flex align-items-center"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                  <Form.Control.Feedback type="invalid" className="small">
                    {errors.newPassword?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group controlId="set-password-confirm">
                <Form.Label className={styles.formLabel}>
                  Xác nhận mật khẩu *
                </Form.Label>
                <InputGroup className={styles.inputGroup} hasValidation>
                  <InputGroup.Text className={styles.inputIcon}>
                    <LockKeyhole size={18} aria-hidden="true" />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu mới"
                    isInvalid={Boolean(errors.confirmPassword)}
                    disabled={isSubmitting}
                    className={styles.inputControl}
                    {...register("confirmPassword")}
                  />
                  <Form.Control.Feedback type="invalid" className="small">
                    {errors.confirmPassword?.message}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Button
                type="submit"
                className={`${styles.submitButton} w-100 py-2 mt-4 fw-semibold rounded-3 shadow-sm`}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Spinner animation="border" size="sm" className="me-2" />
                )}
                Lưu mật khẩu
              </Button>
            </Form>
          )}
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

export default SetPasswordPage;
