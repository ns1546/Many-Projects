export const dynamic = 'force-dynamic';
import CategoryPage from '../category/[slug]/page';

export default async function Shop({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  return <CategoryPage params={Promise.resolve({ slug: 'shop' })} searchParams={searchParams} />;
}
