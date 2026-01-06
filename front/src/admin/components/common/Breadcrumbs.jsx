import React from 'react';
import { Link } from 'react-router-dom';
import { LuChevronRight } from 'react-icons/lu';

const Breadcrumbs = ({ title, items }) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <div className="text-sm text-gray-500 flex items-center">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const isObject = typeof item === 'object' && item !== null;
                    const label = isObject ? item.label : item;
                    const to = isObject ? item.to : undefined;

                    const commonClass = isLast
                        ? 'text-[#707070] font-medium'
                        : 'font-medium text-black';
                    return (
                        <React.Fragment key={index}>
                            {index > 0 && <span className="mx-1"><LuChevronRight /></span>}
                            {to && !isLast ? (
                                <Link
                                    to={to}
                                    className={`${commonClass} hover:underline`}
                                >
                                    {label}
                                </Link>
                            ) : (
                                <span className={commonClass}>
                                    {label}
                                </span>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    );
};

export default Breadcrumbs;
