import { useSearchParams } from 'react-router-dom';
import TableSearch from './TableSearch';

const SearchDomain = () => {
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    return (
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 pt-32 pb-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Domain Search</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Search and analyze domain information including security status, DNS data, and threat intelligence.
                </p>
            </div>
            
            <TableSearch initialSearch={initialSearch} />
        </div>
    );
};

export default SearchDomain;