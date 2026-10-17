import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import customer1 from "../../../../assets/customer1.jpg";
import customer2 from "../../../../assets/customer2.jpg";
import customer3 from "../../../../assets/customer3.jpg";
import customer4 from "../../../../assets/customer4.jpg";
import customer5 from "../../../../assets/customer5.jpg";
import styles from "./CustomerGallery.module.css";

const photos = [
    { src: customer1, alt: "Khách hàng 1" },
    { src: customer2, alt: "Khách hàng 2" },
    { src: customer3, alt: "Khách hàng 3" },
    { src: customer4, alt: "Khách hàng 4" },
    { src: customer5, alt: "Khách hàng 5" },
];

const CustomerGallery = () => {
    const [visibleCount, setVisibleCount] = useState(4);
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const lastIndex = photos.length - visibleCount;

    useEffect(() => {
        const tablet = window.matchMedia("(max-width: 768px)");
        const mobile = window.matchMedia("(max-width: 480px)");
        const updateCount = () => {
            const count = mobile.matches ? 1 : tablet.matches ? 2 : 4;
            setVisibleCount(count);
            setIndex((previous) => Math.min(previous, photos.length - count));
        };

        updateCount();
        tablet.addEventListener("change", updateCount);
        mobile.addEventListener("change", updateCount);
        return () => {
            tablet.removeEventListener("change", updateCount);
            mobile.removeEventListener("change", updateCount);
        };
    }, []);

    useEffect(() => {
        if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const timer = setInterval(() => {
            setIndex((previous) => (previous >= lastIndex ? 0 : previous + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [lastIndex, paused]);

    return (
        <section className={styles.section} aria-label="Hình ảnh từ khách hàng">
            <h2 className={styles.title}>hình ảnh từ khách hàng</h2>
            <p className={styles.subtitle}>
                hãy gắn thẻ #babyclothesshop và trở thành thành viên của bộ sưu tập
            </p>
            <div
                className={styles.carousel}
                aria-label="Bộ sưu tập ảnh khách hàng"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onFocusCapture={() => setPaused(true)}
                onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
                }}
            >
                <div className={styles.track} style={{ "--index": Math.min(index, lastIndex) }}>
                    {photos.map((photo) => (
                        <img
                            key={photo.alt}
                            className={styles.photo}
                            src={photo.src}
                            alt={photo.alt}
                            loading="lazy"
                        />
                    ))}
                </div>
                <button
                    className={`${styles.arrow} ${styles.previous}`}
                    type="button"
                    aria-label="Ảnh khách hàng trước"
                    onClick={() => setIndex((previous) => (previous <= 0 ? lastIndex : previous - 1))}
                >
                    <ChevronLeft aria-hidden="true" size={24} />
                </button>
                <button
                    className={`${styles.arrow} ${styles.next}`}
                    type="button"
                    aria-label="Ảnh khách hàng tiếp theo"
                    onClick={() => setIndex((previous) => (previous >= lastIndex ? 0 : previous + 1))}
                >
                    <ChevronRight aria-hidden="true" size={24} />
                </button>
            </div>
            <div className={styles.actions}>
                <Link className={styles.button} to="/about">
                    Xem tất cả hình ảnh
                </Link>
            </div>
        </section>
    );
};

export default CustomerGallery;
