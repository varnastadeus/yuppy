module.exports = {
    'projects': [
        {
            'name': 'Angular app',
            'commands': {
                'start': 'webpack --watch --config ./webpack/angular.webpack.js',
                'test': 'karma start',
                'echo': 'echo Hello Angular'
            }
        },
        {
            'name': 'Vue app',
            'commands': {
                'start': 'webpack --watch --config ./webpack/vue.webpack.js',
                'test': 'mocha',
                'echo': 'echo Hello Vue'
            }
        },
        {
            'name': 'React app',
            'commands': {
                'start': 'webpack --watch --config ./webpack/react.webpack.js',
                'test': 'jest',
                'echo': 'echo Hello React'
            }
        }
    ]
}
