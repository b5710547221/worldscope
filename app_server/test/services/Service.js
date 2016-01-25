var rfr = require('rfr');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var Code = require('code');
var expect = Code.expect;

var Storage = rfr('app/models/Storage');
var Service = rfr('app/services/Service');
var CustomError = rfr('app/util/Error');
var TestUtils = rfr('test/TestUtils');

/*lab.experiment('Service tests for User', function () {
  var bob = {
    username: 'Bob',
    alias: 'Bob the Builder',
    email: 'bob@bubblegum.com',
    password: 'generated',
    accessToken: 'xyzabc',
    platformType: 'facebook',
    platformId: '1238943948',
    description: 'bam bam bam'
  };

  lab.beforeEach(function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('createNewUser missing particulars returns null', function(done) {
    Service.createNewUser().then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('createNewUser invalid fields returns null', function(done) {
    Service.createNewUser({something: 'abc'}).then(function (result) {
      Code.expect(result).to.be.null();
      done();
    });
  });

  lab.test('createNewUser valid particulars', function(done) {
    Service.createNewUser(bob).then(function (result) {
      Code.expect(result.username).to.equal(bob.username);
      Code.expect(result.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserByPlatform invalid platformType', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform('bogusmedia', result.platformId);
    }).then(function(user) {
      console.log(user);
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getUserByPlatform invalid platformId', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform(result.platformType, 'invalidId');
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('getUserByPlatform valid arguments', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserByPlatform(result.platformType,
                                           result.platformId);
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username);
      Code.expect(user.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserById valid arguments', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.getUserById(result.userId);
    }).then(function(user) {
      Code.expect(user.username).to.equal(bob.username);
      Code.expect(user.password).to.equal(bob.password);
      done();
    });
  });

  lab.test('getUserById invalid arguments', function(done) {
    return Service.getUserById('123xyz')
    .then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateUserParticulars invalid userId', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUserParticulars('invalidUserId',
                                           result);
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateUserParticulars missing particulars', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUserParticulars(result.userId);
    }).then(function(user) {
      Code.expect(user).to.be.null();
      done();
    });
  });

  lab.test('updateUserParticulars valid', function(done) {
    Service.createNewUser(bob).then(function (result) {
      return Service.updateUserParticulars(result.userId,
          {email: 'newemail@lahlahland.candy'});
    }).then(function(user) {
      Code.expect(user.email).to.equal('newemail@lahlahland.candy');
      done();
    });
  });
});*/

lab.experiment('Service tests for Streams', function () {
  var testStream = {
    title: 'this is a title from stream service',
    description: 'arbitrary description',
    appInstance: '123-123-123-123'
  };

  var testStream2 = {
    title: 'Its more recent title from stream service',
    description: 'arbitrary description',
    appInstance: '7777-777-777',
    createdAt: new Date('2017-07-07')
  };

  var testStream3 = {
    title: 'old stream, ended stream',
    description: 'arbitrary description',
    appInstance: '7999-777-777',
    createdAt: new Date('2015-01-01'),
    endedAt: new Date('2015-01-02'),
    live: false
  };

  var bob = {
    username: 'Bob',
    alias: 'Bob the Builder',
    email: 'bob@bubblegum.com',
    password: 'generated',
    accessToken: 'xyzabc',
    platformType: 'facebook',
    platformId: '1238943948',
    description: 'bam bam bam'
  };

  lab.beforeEach({timeout: 10000}, function (done) {
    TestUtils.resetDatabase(done);
  });

  lab.test('createNewStream valid', function(done) {
    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream);
    }).then(function(result) {
      Code.expect(result.title).to.be.equal(testStream.title);
      Code.expect(result.description).to.be.equal(testStream.description);
      done();
    });
  });

  lab.test('createNewStream undefined userId', function(done) {
    Service.createNewStream(bob.userId, testStream).then(function (result) {
      Code.expect(result).to.be.an.instanceof(CustomError.NotFoundError);
      Code.expect(result.message).to.be.equal('User not found');
      done();
    });
  });

  lab.test('createNewStream invalid missing appInstance', function(done) {
    var testStream = {
      title: 'this is a title from stream service',
      description: 'arbitrary description'
    };

    Service.createNewStream(bob.userId, testStream).then(function (result) {
      Code.expect(result).to.be.an.instanceof(CustomError.InvalidFieldError);
      done();
    });
  });

  lab.test('createNewstream invalid empty title', function(done) {
    var testStream = {
      title: '',
      description: 'arbitrary description',
      appInstance: '123-123-123-123'
    };

    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream);
    }).then(function(result) {
      Code.expect(result).to.be.an.instanceof(CustomError.InvalidFieldError);
      Code.expect(result.extra).to.be.equal('title');
      done();
    });
  });

  lab.test('createNewstream invalid duplicate appInstance', function(done) {
    var dupStream = {
      title: 'duplicate',
      description: 'arbitrary description',
      appInstance: '123-123-123-123'
    };

    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, dupStream);
    }).then(function(result) {
      Code.expect(result).to.be.an.instanceof(CustomError.InvalidFieldError);
      Code.expect(result.message).to.be.equal('appInstance must be unique');
      Code.expect(result.extra).to.be.equal('appInstance');
      done();
    });
  });

  lab.test('getStreamById valid', function(done) {
    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream);
    }).then(function(result) {
      return Service.getStreamById(result.streamId);
    }).then(function(result) {
      Code.expect(result.title).to.be.equal(testStream.title);
      Code.expect(result.description).to.be.equal(testStream.description);
      done();
    });
  });

  lab.test('getStreamById empty Id', function(done) {
    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream);
    }).then(function(result) {
      return Service.getStreamById('');
    }).then(function(result) {
      Code.expect(result).to.be.an.instanceof(CustomError.NotFoundError);
      Code.expect(result.message).to.be.equal('Stream not found');
      done();
    });
  });

  lab.test('getStreamById invalid Id', function(done) {
    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream);
    }).then(function(result) {
      return Service.getStreamById('asd-234234');
    }).then(function(result) {
      Code.expect(result).to.be.an.instanceof(CustomError.NotFoundError);
      Code.expect(result.message).to.be.equal('Stream not found');
      done();
    });
  });

  lab.test('getListOfStreams valid sorted by title', function(done) {
    var filters = {
      state: 'all',
      sort: 'title',
      order: 'asc'
    };

    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, testStream2);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, testStream3);
    }).then(function() {
      return Service.getListOfStreams(filters);
    }).then(function(result) {
      Code.expect(result).to.have.length(3);
      Code.expect(result[0].title).to.be.equal(testStream2.title);
      Code.expect(result[1].title).to.be.equal(testStream3.title);
      Code.expect(result[2].title).to.be.equal(testStream.title);
      done();
    });
  });

  lab.test('getListOfStreams valid live sorted by time', function(done) {
    var filters = {
      state: 'live',
      sort: 'time',
      order: 'desc'
    };

    Service.createNewUser(bob).then(function (user) {
      return Service.createNewStream(user.userId, testStream);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, testStream2);
    }).then(function(stream) {
      return Service.createNewStream(stream.owner, testStream3);
    }).then(function() {
      return Service.getListOfStreams(filters);
    }).then(function(result) {
      Code.expect(result).to.have.length(2);
      Code.expect(result[0].title).to.be.equal(testStream2.title);
      Code.expect(result[1].title).to.be.equal(testStream.title);
      done();
    });
  });

  lab.test('getListOfStreams valid no streams', function(done) {
    var filters = {
      state: 'all',
      sort: 'title',
      order: 'asc'
    };

    Service.getListOfStreams(filters).then(function(result) {
      Code.expect(result).to.have.length(0);
      done();
    });
  });
});
