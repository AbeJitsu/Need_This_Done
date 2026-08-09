import { permanentRedirect } from 'next/navigation';

/** The founder/background material now lives beside the proof on /work. */
export default function AboutPage() {
  permanentRedirect('/work');
}
