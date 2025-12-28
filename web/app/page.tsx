import { getSurahs, getTafsirPlus } from '../lib/api';
import HomeTabs from './components/HomeTabs';

export default function Home() {
  const surahs = getSurahs();
  const plusEntries = getTafsirPlus();

  return (
    <main className="min-h-screen p-8 sm:p-12 lg:p-16">
      <HomeTabs surahs={surahs} plusEntries={plusEntries} />
    </main>
  );
}
