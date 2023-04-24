module.exports = {
    extends:[  //  继承一些规则
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',  //代码格式自动修复
        'plugin:prettier/recommended' 
    ],
    parser: '@typescript-eslint/parser',  // 外部的解析器
    parserOptions: {  // 解析配置
        ecmaFeatures: {
          jsx: true
        },
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    plugins: ['react', '@typescript-eslint', 'react-hooks','prettier'], // 插件
    rules: { // 自定义配置
      'prettier/prettier': 'error',
      quotes: ['error', 'single'],  // 单引号
      semi: ['error', 'always'],    // 分号
      'react/react-in-jsx-scope': 'off' // react配置
    },
    settings: {  // 自动探测react版本号
        react: {
          version: 'detect'
        }
    }
}