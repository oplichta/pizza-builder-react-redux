import './Loader.scss';

const Loader = ({ color = 'white', height = '20px' }) => {
    return (
        <span
            className="loader"
            style={{ width: height, height, borderColor: color, borderTopColor: 'transparent' }}
        />
    );
};

export default Loader;
