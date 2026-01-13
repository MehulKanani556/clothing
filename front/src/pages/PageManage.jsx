import React from 'react';
import { getLegalPage } from '../redux/slice/legalPage.slice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import 'react-quill-new/dist/quill.snow.css';

export default function PageManage() {

    const dispatch = useDispatch();
    const location = useLocation();
    const { currentLegalPage, loading, success, message, error } = useSelector((state) => state.legalPage);

    // console.log(currentLegalPage?.content);

    const getSlugFromPath = (path) => {
        const lowerPath = path.toLowerCase();
        if (lowerPath.includes('privacypolicy')) return 'privacy-policy';
        if (lowerPath.includes('terms')) return 'terms-conditions';
        if (lowerPath.includes('security')) return 'security';
        if (lowerPath.includes('cookie')) return 'cookie-statement';
        if (lowerPath.includes('legal')) return 'legal-page';
        return 'privacy-policy';
    };

    const slug = getSlugFromPath(location.pathname);

    useEffect(() => {
        dispatch(getLegalPage(slug));
    }, [dispatch, slug]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg pt-8">
                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 mb-5">{currentLegalPage?.title}</h1>
                {slug === 'privacy-policy' && <p className="text-sm text-[#707070] mb-6">Last Updated on <span className="font-semibold text-black">{new Date(currentLegalPage?.updatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>}
                <div className="ql-snow mb-10">
                    <div
                        dangerouslySetInnerHTML={{ __html: currentLegalPage?.content?.replace(/&nbsp;/g, ' ') }}
                        className="ql-editor prose prose-ol:m-0 prose-ol:p-0 prose-ul:m-0 prose-ul:p-0 w-full max-w-full !p-0 space-y-4"
                        style={{ minHeight: 'auto' }}
                    />
                </div>
            </div>
        </div>
    )
}
