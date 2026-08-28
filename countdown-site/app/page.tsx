import CountdownPage from '../src/countdown-page/CountdownPage';

export default function Home() {
  return <CountdownPage initialNow={Date.now()} />;
}
