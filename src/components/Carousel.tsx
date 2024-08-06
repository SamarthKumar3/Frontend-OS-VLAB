import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Carousel.css'; // Optional for additional custom styles

interface CarouselProps {
    images: string[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };
    
    return (
        <div className="carousel">
            <Slider {...settings}>
                {images.map((image, index) => (
                    <div key={index} className="carousel-images">
                        <img src={image} alt={`Slide ${index}`} className="carousel-image" />
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default Carousel;
