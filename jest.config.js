module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    testPathIgnorePatterns: [
      "/node_modules/",
      "/android/",
      "/ios/"
    ],
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase)"
      ],
    
    transform: {
        // "^.+\\.jsx?$": "babel-jest",
        // "^.+\\.mjs$": "babel-jest",
        // "^.+\\.tsx$": "babel-jest"
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
      },

    moduleFileExtensions: ["ts", "tsx", "js"],
    // plugins: [
    //     ["@babel/plugin-transform-class-properties"],
    //     ["@babel/plugin-transform-private-methods"],
    //     ["@babel/plugin-transform-private-property-in-object"]
    //  ]
  
  };
  