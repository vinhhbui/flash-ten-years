import DynamicHeader from '../../../src/components/DynamicHeader';
import LandingPage from '../../../src/landing-page/LandingPage';

export default function DevLandingPage() {
  return (
    <>
      <LandingPage isActive standalone />
      <DynamicHeader expanded />
    </>
  );
}
