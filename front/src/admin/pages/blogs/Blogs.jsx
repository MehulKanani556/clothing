import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, createBlog } from '../../../redux/slice/blog.slice';
import { MdAdd, MdImage, MdArticle } from 'react-icons/md';

const Blogs = () => {
    const dispatch = useDispatch();
    const { blogs, loading } = useSelector(state => state.blogs);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', content: '', tags: '', metaDescription: '' });

    useEffect(() => {
        dispatch(fetchBlogs());
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(createBlog(formData)).then(() => {
            setIsCreating(false);
            setFormData({ title: '', content: '', tags: '', metaDescription: '' });
        });
    };

    if (isCreating) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4">Write New Blog Post</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Content (Markdown/HTML)</label>
                        <textarea className="w-full border p-2 rounded h-48" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Meta Description (SEO)</label>
                        <input className="w-full border p-2 rounded" value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Publish</button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">CMS / Blogs</h2>
                <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    <MdAdd /> New Post
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogs && blogs.length > 0 ? (
                    blogs.map(blog => (
                        <div key={blog._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
                                {blog.bannerImage ? <img src={blog.bannerImage} alt={blog.title} className="w-full h-full object-cover" /> : <MdImage size={48} />}
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <MdArticle /> Blog
                                </div>
                                <h3 className="font-bold text-gray-800 mb-2 truncate">{blog.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{blog.metaDescription || blog.content.substring(0, 50)}...</p>
                                <div className="mt-4 text-xs text-gray-400">Published {new Date(blog.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 text-center text-gray-500">No blog posts found.</div>
                )}
            </div>
        </div>
    );
};

export default Blogs;
