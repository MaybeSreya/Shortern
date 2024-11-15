import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'public', 'db.json');

export default async function handler(req, res) {
  try {
    const db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
    
    if (req.method === 'GET') {
      const { shortner_name } = req.query;
      if (shortner_name) {
        const links = db.links.filter(link => link.shortner_name === shortner_name);
        return res.status(200).json(links);
      }
      return res.status(200).json(db.links);
    } else if (req.method === 'POST') {
      const { shortner_name, shortner_url } = req.body;
      const existingLink = db.links.find(link => link.shortner_name === shortner_name);

      if (existingLink) {
        return res.status(400).json({ message: 'URL Shortener name already exists!' });
      }

      db.links.push({ shortner_name, shortner_url });
      await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
      return res.status(200).json({ message: 'URL Shortener generated successfully!' });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
