// подключаем пакеты модулей из папки node_modules
var gulp = require("gulp"),
	sass = require("gulp-sass"),
	browserSync = require("browser-sync"),
	concat = require("gulp-concat"),
	uglify = require("gulp-uglifyjs"),
	cssnano = require("gulp-cssnano"),
	rename = require("gulp-rename"),
	del = require("del"),
	imagemin = require('gulp-imagemin'),
	pngquant = require("imagemin-pngquant"),
	cache = require("gulp-cache"),
	autoprefixer = require('gulp-autoprefixer');

// создаем пустую инструкцию (таск)
gulp.task("mytask", function(){
	console.log("Привет я таск");
});

// таск для компаляции sass файлов в css
gulp.task("sass", function(){
	return gulp.src("app/sass/**/*.sass")  // берем исходный файл
				.pipe(sass()) // преобразовываем в css посредством gulp-sass
				.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
				.pipe(gulp.dest("app/css")) // сохраняем итог в app/css
				.pipe(browserSync.reload({stream : true}))
});

// таск для Brouwser Sync 
gulp.task("browser-sync", function(){
	browserSync({
		server : {
			baseDir : "app"
		},
		notify : false
	});
});

// таск сжатия всех библиотек
gulp.task("scripts", function(){
	return gulp.src([
			"app/libs/jquery/dist/jquery.min.js",
			'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js'
		])
	.pipe(concat("libs.min.js")) // итоговый файл
	.pipe(uglify()) // сжатие js файла
	.pipe(gulp.dest("app/js")); // выгрузка в папку со скриптами
});

// таск минификации css с задачей таска sass
gulp.task("css-libs", ["sass"], function(){
	return gulp.src("app/css/libs.css")
			   .pipe(cssnano()) // сжимаем выбранные файлы
			   .pipe(rename({suffix : ".min"})) // добавляем суффикс к итоговому файлу
			   .pipe(gulp.dest("app/css")); // сохраняем итог в каталог
});

// таск наблюдения
gulp.task("watch", ["browser-sync", "css-libs", "scripts"], function(){
	gulp.watch("app/sass/**/*.sass", ["sass"]); // наблюдение за sass файлами
	gulp.watch("app/*.html", browserSync.reload); // наблюдение за html
	gulp.watch("app/js/**/*.js", browserSync.reload); // наблюдение за js
});

// таск очистки dist
gulp.task("clean", function(){
	return del.sync("dist"); // Удаляем папку dist перед сборкой
});

//таск для сжатия изображений
gulp.task("img", function(){
	return gulp.src("app/img/**/*") // берем все картинки
		.pipe(cache(imagemin({
			interlaced : true,
			progressive : true,
			svgoPlugins : [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest("dist/img"));
});

// таск генерирования проекта в продакшен
gulp.task("build", ["clean", "img", "sass", "scripts"], function(){

	// Переносим CSS стили в продакшен
	var buildCss = gulp.src([ 
		"app/css/main.css",
		"app/css/libs.min.css"
		])
		.pipe(gulp.dest("dist/css"));

	// Переносим скрипты в продакшен
	var buildJs = gulp.src("app/js/**/*") 
				.pipe(gulp.dest("dist/js"));

	// Переносим шрифты в продакшен
	var buildFonts = gulp.src("app/fonts/**/*")
					.pipe(gulp.dest("dist/fonts"));

	// Переносим HTML в продакшен
	var buildHtml = gulp.src("app/*.html")
					.pipe(gulp.dest("dist"));
});

//таск для очистки кеша
gulp.task("clear", function(){
	return cache.clearAll();
});

// такс по умолчанию (в консоли протсо 'gulp')
gulp.task("default", ["watch"]);