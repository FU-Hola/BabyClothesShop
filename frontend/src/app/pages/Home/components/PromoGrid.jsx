import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import carrierGuide from "../../../../assets/1_mtc_diu_1905.jpg";
import carrierPromo from "../../../../assets/2_ghe_t_1905.jpg";
import birthChecklist from "../../../../assets/1200x628_copy_du_sinh_2101_mtc.jpg";
import styles from "./PromoGrid.module.css";

const promotions = [
    {
        label: "Sản phẩm địu cho bé",
        slides: [
            { src: carrierPromo, alt: "Khám phá sản phẩm địu cho bé yêu", to: "/quan-ao-so-sinh" },
            { src: carrierGuide, alt: "Bé an toàn, mẹ tự tin hơn khi sử dụng địu", to: "/quan-ao-so-sinh" },
        ],
    },
    {
        label: "Chuẩn bị đón bé",
        slides: [
            { src: birthChecklist, alt: "Checklist dự sinh", to: "/quan-ao-so-sinh" },
            { src: carrierGuide, alt: "Hướng dẫn sử dụng địu cho bé", to: "/quan-ao-so-sinh" },
        ],
    },
];

const PromoSlider = ({ label, slides }) => {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = setInterval(() => {
            setIndex((previous) => (previous + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [paused, slides.length]);

    return (
        <div
            className={styles.promo}
            aria-label={label}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}
        >
            <div className={styles.frame}>
                {slides.map((slide, position) => (
                    <Link
                        key={slide.src}
                        className={`${styles.slide} ${position === index ? styles.active : ""}`}
                        to={slide.to}
                        aria-hidden={position !== index}
                        tabIndex={position === index ? 0 : -1}
                    >
                        <img className={styles.image} src={slide.src} alt={slide.alt} loading="lazy" />
                    </Link>
                ))}
            </div>
            <div className={styles.dots} role="group" aria-label={`Chọn ảnh ${label}`}>
                {slides.map((slide, position) => (
                    <button
                        key={slide.src}
                        type="button"
                        className={`${styles.dot} ${position === index ? styles.dotActive : ""}`}
                        aria-label={`Xem ${slide.alt}`}
                        aria-pressed={position === index}
                        onClick={() => setIndex(position)}
                    />
                ))}
            </div>
        </div>
    );
};

const PromoGrid = () => (
    <section className={styles.grid} aria-label="Khuyến mãi">
        {promotions.map((promotion) => (
            <PromoSlider key={promotion.label} {...promotion} />
        ))}
    </section>
);

export default PromoGrid;
