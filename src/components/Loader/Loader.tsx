import './Loader.scss';

interface LoaderProps {
  color?: string;
  height?: string;
}

const Loader = ({ color = 'white', height = '20px' }: LoaderProps) => {
  return (
    <span
      className="loader"
      style={{ width: height, height, borderColor: color, borderTopColor: 'transparent' }}
    />
  );
};

export default Loader;
