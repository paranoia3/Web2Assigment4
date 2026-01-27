const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/blogDB')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    body: {
        type: String,
        required: [true, "Body is required"]
    },
    author: {
        type: String,
        default: "Anonymous"
    }
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

app.get('/', (req, res) => {
    res.send('Server is running! Open the index.html file in browser');
});

app.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });
        res.json(blog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/blogs', async (req, res) => {
    const blog = new Blog({
        title: req.body.title,
        body: req.body.body,
        author: req.body.author || "Anonymous"
    });

    try {
        const newBlog = await blog.save();
        res.status(201).json(newBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.put('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        if (req.body.title != null) blog.title = req.body.title;
        if (req.body.body != null) blog.body = req.body.body;
        if (req.body.author != null) blog.author = req.body.author;

        const updatedBlog = await blog.save();
        res.json(updatedBlog);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/blogs/:id', async (req, res) => {
    try {
        const result = await Blog.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'Blog not found' });

        res.json({ message: 'Deleted blog post' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});