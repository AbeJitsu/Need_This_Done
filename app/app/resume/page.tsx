import { permanentRedirect } from 'next/navigation';

/** The compact experience summary now lives beside the proof on /work. */
export default function ResumePage() {
  permanentRedirect('/work');
}
