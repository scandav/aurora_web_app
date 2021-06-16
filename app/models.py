from app import db, ma
from datetime import datetime

class PVData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, default=datetime.now, nullable=False)
    grid_voltage = db.Column(db.Float, nullable=False)
    grid_current = db.Column(db.Float, nullable=False)
    grid_power = db.Column(db.Integer, nullable=False)
    invert_temp = db.Column(db.Float, nullable=False)
    booster_temp = db.Column(db.Float, nullable=False)
    pwr_peak = db.Column(db.Integer, nullable=False)
    pwr_peak_td = db.Column(db.Integer, nullable=False)
    nrg = db.Column(db.Integer, nullable=False)
    nrg_td = db.Column(db.Integer, nullable=False)

class PVDataSchema(ma.Schema):
    class Meta:
        # Fields to expose
        fields = ("created", "grid_power", "nrg_td", "invert_temp", "booster_temp")

pvdata_schema = PVDataSchema()