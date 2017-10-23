import gulp from "gulp";

import rollup from "rollup-stream";
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

import sourcemaps from "gulp-sourcemaps";

import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";

import postcss from "gulp-postcss";
import autoprefixer from "autoprefixer";

import browserSync from "browser-sync";

import uglify from "gulp-uglify";

import awspublish from "gulp-awspublish";
import rename from "gulp-rename";
import path from "path";

function javascript() {
  return rollup({
    input: './src/index.js',
    sourcemap: true,
    format: 'iife',
    plugins: [
      resolve({
        jsnext: true,
      }),
      babel({
        exclude: "./node_modules/**",
        babelrc: false,
        presets: [
          ["env", {
            "modules": false,
          }],
        ],
      }),
    ],
  })
  .on("error", function(err) {
    console.error(err);
    this.emit('end', err);
  })
  .on('end', function(error) {
    if(error) {
      browserSync.error = true;
    }
  })
  .pipe(source("index.js", "./src"))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sourcemaps.write("."))
  .pipe(gulp.dest("./dist"));
}

function html() {
  return gulp.src("./src/**/*.html")
    .pipe(gulp.dest("./dist"));
}

function css() {
  return gulp.src("./src/**/*.css")
    .pipe(sourcemaps.init())
    .pipe(postcss([
      autoprefixer(),
    ]))
    .on("error", function(err) {
      console.error(err.stack);
      this.emit('end', error);
    })
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("./dist"))
    .pipe(browserSync.stream());
}

function reload() {
  if(browserSync.error) {
    browserSync.error = false;
    console.info("skipping reload due to error");
  }
  else {
    browserSync.reload();
  }
  return Promise.resolve();
}

function deploy() {
  const config = require("./config.json");

  let publisher = awspublish.create({
    endpoint: 'https://nyc3.digitaloceanspaces.com',
    params: {
      Bucket: 'cybertac',
    },
    accessKeyId: config.ACCESS_KEY_ID,
    secretAccessKey: config.SECRET_ACCESS_KEY,
  });

  

  return gulp.src("./dist/**/*")
    .pipe(rename(file => {
      file.dirname = path.join("production/", file.dirname);
    }))
    .pipe(awspublish.gzip({level: 9}))
    .pipe(publisher.publish())
    .pipe(awspublish.reporter());
}

function watch() {
  gulp.watch("./src/**/*.css", css);
  gulp.watch("./src/**/*.html", gulp.series(html, reload));
  gulp.watch("./src/**/*.js", gulp.series(javascript, reload));
}

function serve() {
  browserSync.init({
    server: {
      baseDir: "./dist/"
    }
  })
}

gulp.task(javascript);
gulp.task(html);
gulp.task(css);

gulp.task("build", gulp.parallel(javascript, html, css));

gulp.task(watch);

gulp.task("dev", gulp.series("build", gulp.parallel(watch, serve)));

gulp.task(deploy);