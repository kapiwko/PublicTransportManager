<?php

namespace App\Query;

use App\Entity\BusStop;
use App\ViewData\BusStopData;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;
use Ramsey\Uuid\UuidInterface;

class GetBusStopQuery implements QueryInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(UuidInterface $id): ?BusStopData
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->from(BusStop::class, 'busStop');
        $queryBuilder->select(
            'busStop.id',
            'busStop.location',
            'IDENTITY(busStop.group) as group'
        );
        $queryBuilder->where('busStop.id = :id');
        $queryBuilder->setParameter('id', $id);
        $queryBuilder->groupBy('busStop.id');
        $query = $queryBuilder->getQuery();

        $data = $query->getOneOrNullResult(AbstractQuery::HYDRATE_ARRAY);
        if ($data) {
            $group = $data['group'] ? Uuid::fromString($data['group']) : null;
            return new BusStopData($data['id'], $data['location'], $group);
        }
        return null;
    }
}