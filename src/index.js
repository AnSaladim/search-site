const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;

// Пути к папкам
const documentsPath = path.join(__dirname, "../documents");
const publicPath = path.join(__dirname, "../public");
let invertedIndex = {};

// Функция для построения инвертированного индекса
function buildIndex(directory) {
    const files = fs.readdirSync(directory);
    console.log("Файлы для индексирования:", files);
  
    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const content = fs.readFileSync(filePath, "utf8").toLowerCase();
      console.log(`Содержимое файла "${file}":`, content);
  
      // Извлечение слов (русский + латинский алфавиты, цифры)
      const words = content.match(/[а-яёa-z0-9]+/gi) || [];
      console.log(`Слова из файла "${file}":`, words);
  
      words.forEach((word) => {
        if (!invertedIndex[word]) {
          invertedIndex[word] = [];
        }
        if (!invertedIndex[word].includes(file)) {
          invertedIndex[word].push(file);
        }
      });
    });
  
    console.log("Построенный инвертированный индекс:", invertedIndex);
  }

// Построение индекса при запуске сервера
buildIndex(documentsPath);

// Middleware для обработки форм и статических файлов
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath)); // Отдаем файлы из папки public

// Обработка поиска
app.get("/search", (req, res) => {
  const query = req.query.query.toLowerCase();
  const result = invertedIndex[query] || []; // Находим файлы или возвращаем пустой массив

  if (result.length === 0) {
    res.send(`
      <p>Слово "${query}" не найдено в документах.</p>
      <a href="/">Назад</a>
    `);
  } else {
    const fileList = result.map((file) => `<li>${file}</li>`).join("");
    res.send(`
      <p>Слово "${query}" найдено в следующих файлах:</p>
      <ul>${fileList}</ul>
      <a href="/">Назад</a>
    `);
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});







