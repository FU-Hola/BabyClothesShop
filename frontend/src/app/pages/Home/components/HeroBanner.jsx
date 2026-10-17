import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroBeGai from "../../../../assets/NEW_ARRIVAL.jpg";
import heroSoSinh from "../../../../assets/NEW_ARRIVAL_2.jpg";
import heroBeTrai from "../../../../assets/NEW_ARRIVAL_3.jpg";
import styles from "./HeroBanner.module.css";

const slides = [
    { src: heroBeGai, alt: "Thời trang bé gái", to: "/thoi-trang-be-gai" },
    { src: heroSoSinh, alt: "Thời trang bé sơ sinh", to: "/quan-ao-so-sinh" },
    { src: heroBeTrai, alt: "Thời trang bé trai", to: "/thoi-trang-be-trai" },
];

const HeroBanner = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className={styles.hero} aria-label="Banner khuyến mãi">
            {slides.map((slide, i) => (
                <Link
                    key={slide.alt}
                    to={slide.to}
                    className={`${styles.slide} ${i === index ? styles.active : ""}`}
                    aria-hidden={i !== index}
                    tabIndex={i !== index ? -1 : 0}
                >
                    <img className={styles.image} src={slide.src} alt={slide.alt} />
                </Link>
            ))}
            <div className={styles.dots}>
                {slides.map((slide, i) => (
                    <button
                        key={slide.alt}
                        type="button"
                        className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                        aria-label={`Xem banner ${slide.alt}`}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroBanner;
