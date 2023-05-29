{
  "targets": [
    {
      "target_name": "addon",
      'conditions': [  
                ['OS=="win"', {
                    "sources": [ "addon/windows/url.cc" ]
                }],
      ]
    }
  ]
}
