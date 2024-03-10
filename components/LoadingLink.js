import { useRouter } from 'next/router';
import { useLoading } from '../context/LoadingContext';
import Link from 'next/link';
import styles from '../styles/songs.module.css';

const LoadingLink = ({ children, href, ...props }) => {
  const router = useRouter();
  const { startLoading, stopLoading } = useLoading();

  const handleClick = (e) => {
    e.preventDefault();
    startLoading();
    router.push(href).then(stopLoading);
  };

  return (
    <Link href={href} {...props} passHref>
      <div style={{width: '100%', display: 'flex', alignItems: 'center'}} onClick={handleClick}>{children}</div>
    </Link>
  );
};

export default LoadingLink;
