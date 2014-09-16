'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('gogeo-devguide.services', []).
  value('version', '0.1.0').
  value('mapkey', '7252e0f7-c0f0-4c0b-98eb-c37fc4a5effa')
  ;
