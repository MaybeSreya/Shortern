import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/:shortName" component={RedirectToUrl} />
      </Switch>
    </Router>
  );
};

const Home = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [shortName, setShortName] = useState('');
  const [message, setMessage] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the short name already exists
    try {
      const response = await axios.get(`/api/links?shortner_name=${shortName}`);
      if (response.data.length > 0) {
        setMessage('URL Shortener name already exists!');
        return;
      }

      // Create a new short URL entry
      const newLink = { shortner_name: shortName, shortner_url: originalUrl };
      await axios.post('/api/links', newLink);
      setMessage('URL Shortener generated successfully!');
      setShortUrl(`http://localhost:3000/${shortName}`);
    } catch (error) {
      setMessage('Error creating the short URL.');
    }
  };

  return (
    <div className="App">
      <h1>URL Shortener</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Original URL:</label>
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Short Name:</label>
          <input
            type="text"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Generate Short URL</button>
      </form>

      {message && <p>{message}</p>}
      {shortUrl && <p>Short URL: <a href={shortUrl}>{shortUrl}</a></p>}
    </div>
  );
};

const RedirectToUrl = ({ match }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const getUrl = async () => {
      try {
        const response = await axios.get(`/api/links?shortner_name=${match.params.shortName}`);
        if (response.data.length > 0) {
          setUrl(response.data[0].shortner_url);
        } else {
          setUrl(null);
        }
      } catch (error) {
        setUrl(null);
      }
    };

    getUrl();
  }, [match.params.shortName]);

  if (url === null) {
    return <h2>Short URL Not Found !</h2>;
  }

  if (url) {
    window.location.href = url;
  }

  return <h2>Redirecting...</h2>;
};

export default App;
