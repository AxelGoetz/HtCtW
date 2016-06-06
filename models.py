from app import db


class Station(db.Model):
    __tablename__ = 'station'

    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    recordings = db.relationship('Recording', backref="post", cascade="all, delete-orphan", lazy='dynamic')

    def as_dict(self):
        return {
            'id': self.id, 'latitude': self.latitude, 'longitude': self.longitude
        }

    def __init__(self, latitude, longitude):
        self.latitude = latitude
        self.longitude = longitude

    def __repr__(self):
        return '{id: {}}'.format(self.id)


class Recording(db.Model):
    __tablename__ = 'recording'

    id = db.Column(db.Integer, primary_key=True)
    station = db.Column(db.Integer, db.ForeignKey('station.id'), nullable=False)
    datetime = db.Column(db.DateTime, nullable=False)
    speed = db.Column(db.Float)

    def as_dict(self):
        return {
            'id': self.id, 'station': self.station, 'datetime': self.datetime, 'speed': self.speed
        }

    def __init__(self, station, datetime, speed):
        self.station = station
        self.datetime = datetime
        self.speed = speed

    def __repr__(self):
        return '{' + ','.join(self.__dict__.keys()) + '}'
