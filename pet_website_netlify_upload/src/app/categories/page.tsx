export const dynamic = 'force-dynamic';
import CategoryPage from '../category/[slug]/page';

export default async function Categories() {
  return <CategoryPage params={Promise.resolve({ slug: 'shop' })} searchParams={Promise.resolve({})} />;
}
