import { redirect } from 'next/navigation';
import { Navigation } from '@/components/ui/navigation';
import Image from "next/image";

export default function Home() {
  redirect('/execute-campaign');
  
  return null;
}
